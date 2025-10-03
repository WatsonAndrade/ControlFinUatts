package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.dto.AtualizacaoGastoDTO;
import com.uatts.controlegastos.dto.CategoriaResumoDTO;
import com.uatts.controlegastos.dto.CriarGastoDTO;
import com.uatts.controlegastos.dto.ImportacaoResponseDTO;
import com.uatts.controlegastos.dto.ResumoMensalDTO;
import com.uatts.controlegastos.dto.PreviewResponseDTO;
import com.uatts.controlegastos.model.Gasto;
import com.uatts.controlegastos.model.Cartao;
import com.uatts.controlegastos.repository.CartaoRepository;
import com.uatts.controlegastos.service.CsvParserService;
import com.uatts.controlegastos.service.GastoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.io.BufferedReader;
import java.io.StringReader;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/gastos")
public class GastoController {

    private final GastoService gastoService;
    private final CsvParserService csvParserService;
    private final CartaoRepository cartaoRepository;

    public GastoController(GastoService gastoService, CsvParserService csvParserService, CartaoRepository cartaoRepository) {
        this.gastoService = gastoService;
        this.csvParserService = csvParserService;
        this.cartaoRepository = cartaoRepository;
    }

    @PostMapping
    public ResponseEntity<Gasto> criarGasto(@RequestBody Gasto gasto) {
        Gasto novoGasto = gastoService.salvar(gasto);
        return ResponseEntity.ok(novoGasto);
    }

    @GetMapping("/mes/{mesPagamento}")
    public ResponseEntity<List<Gasto>> listarPorMes(@PathVariable String mesPagamento) {
        List<Gasto> gastos = gastoService.buscarPorMes(mesPagamento);
        return ResponseEntity.ok(gastos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarGasto(@PathVariable Long id) {
        gastoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pago")
    public ResponseEntity<Void> atualizarStatusPago(@PathVariable Long id, @RequestBody Boolean pago) {
        Optional<Gasto> optionalGasto = gastoService.buscarPorId(id);
        if (optionalGasto.isPresent()) {
            Gasto gasto = optionalGasto.get();
            gasto.setPago(pago);
            gastoService.salvar(gasto);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/importar")
    public ResponseEntity<Void> importarCSV(@RequestBody List<Gasto> gastos) {
        gastoService.salvarTodos(gastos);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/importar-csv", consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<ImportacaoResponseDTO> importarArquivo(
            @RequestBody String csvText,
            @RequestParam(required = false) Integer mesNumero,
            @RequestParam(required = false) Integer anoPagamento,
            @RequestParam(required = false, defaultValue = "false") Boolean statementMode,
            @RequestParam(required = false, defaultValue = "false") Boolean anchor,
            @RequestParam(required = false) Long cartaoId,
            @RequestParam(required = false) Integer diaFechamento
    ) {
        List<Gasto> gastos;
        Cartao cartao = null;
        if (cartaoId != null) {
            cartao = cartaoRepository.findById(cartaoId).orElse(null);
        }
        if (cartao != null && cartao.getDiaFechamento() != null) {
            gastos = csvParserService.parseWithDiaFechamento(csvText, cartao.getDiaFechamento());
        } else if (diaFechamento != null) {
            gastos = csvParserService.parseWithDiaFechamento(csvText, diaFechamento);
        } else {
            gastos = csvParserService.parse(csvText);
        }

        // Aplica estornos/cancelamentos do CSV (positivos ou negativos) para remover compras equivalentes
        gastos = aplicarEstornosDoCsv(csvText, gastos);

        // Remove as próprias linhas de estorno/cancelamento (alguns emissores trazem como crédito positivo)
        {
            List<Gasto> filtradosLocal = new java.util.ArrayList<>();
            for (Gasto g : gastos) {
                if (!isEstornoOuCancelamentoDescricao(g)) {
                    filtradosLocal.add(g);
                }
            }
            gastos = filtradosLocal;
        }

        if (cartao != null) {
            for (Gasto g : gastos) {
                g.setCartao(cartao);
            }
        }

        // Se estiver em modo "fatura mensal":
        // - Para parcelados: mantém apenas a parcela atual (menor parcela gerada para o grupo)
        // - Para todos: se vier mes/ano, ancora a competência no mês selecionado
        if (Boolean.TRUE.equals(statementMode)) {
            // 1) Colapsar grupos de parcelados para manter apenas a parcela mínima
            java.util.Map<String, Gasto> colapsados = new java.util.HashMap<>();
            for (Gasto g : gastos) {
                if (g.getTotalParcelas() != null && g.getParcelaAtual() != null) {
                    String key = (g.getDescricao() + "|" + g.getValor() + "|" + g.getTotalParcelas()).toLowerCase();
                    Gasto existente = colapsados.get(key);
                    if (existente == null || g.getParcelaAtual() < existente.getParcelaAtual()) {
                        colapsados.put(key, g);
                    }
                }
            }
            List<Gasto> apenasParcelaAtual = new java.util.ArrayList<>();
            java.util.Set<Gasto> manter = new java.util.HashSet<>(colapsados.values());
            for (Gasto g : gastos) {
                if (g.getTotalParcelas() == null || g.getParcelaAtual() == null) {
                    apenasParcelaAtual.add(g); // não parcelados
                } else if (manter.contains(g)) {
                    apenasParcelaAtual.add(g); // a menor parcela do grupo
                }
            }
            gastos = apenasParcelaAtual;
        }

        // 2) Ancorar todos os itens somente se 'anchor=true' e mes/ano fornecidos
        if (Boolean.TRUE.equals(anchor) && mesNumero != null && anoPagamento != null) {
            for (Gasto g : gastos) {
                g.setMesNumero(mesNumero);
                g.setMesPagamento(String.valueOf(mesNumero));
                g.setAnoPagamento(anoPagamento);
            }
        }

        int totalLidas = gastos.size();

        List<Gasto> filtrados = gastoService.filtrarDuplicados(gastos);
        gastoService.salvarTodos(filtrados);

        int importadas = filtrados.size();
        int ignoradas = totalLidas - importadas;

        ImportacaoResponseDTO resposta = new ImportacaoResponseDTO(totalLidas, importadas, ignoradas);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping(value = "/preview-csv", consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<PreviewResponseDTO> previewArquivo(
            @RequestBody String csvText,
            @RequestParam(required = false) Integer diaFechamento,
            @RequestParam(required = false) Long cartaoId,
            @RequestParam(required = false, defaultValue = "false") Boolean statementMode,
            @RequestParam(required = false, defaultValue = "false") Boolean anchor,
            @RequestParam(required = false) Integer mesNumero,
            @RequestParam(required = false) Integer anoPagamento
    ) {
        // 1) Parse com dia de fechamento do cartão (ou override) sem salvar
        List<Gasto> gastos;
        Cartao cartao = null;
        if (cartaoId != null) {
            cartao = cartaoRepository.findById(cartaoId).orElse(null);
        }
        if (cartao != null && cartao.getDiaFechamento() != null) {
            gastos = csvParserService.parseWithDiaFechamento(csvText, cartao.getDiaFechamento());
        } else if (diaFechamento != null) {
            gastos = csvParserService.parseWithDiaFechamento(csvText, diaFechamento);
        } else {
            gastos = csvParserService.parse(csvText);
        }

        // 2) statementMode: colapsa para parcela atual
        if (Boolean.TRUE.equals(statementMode)) {
            java.util.Map<String, Gasto> colapsados = new java.util.HashMap<>();
            for (Gasto g : gastos) {
                if (g.getTotalParcelas() != null && g.getParcelaAtual() != null) {
                    String key = (g.getDescricao() + "|" + g.getValor() + "|" + g.getTotalParcelas()).toLowerCase();
                    Gasto existente = colapsados.get(key);
                    if (existente == null || g.getParcelaAtual() < existente.getParcelaAtual()) {
                        colapsados.put(key, g);
                    }
                }
            }
            java.util.Set<Gasto> manter = new java.util.HashSet<>(colapsados.values());
            List<Gasto> apenasParcelaAtual = new java.util.ArrayList<>();
            for (Gasto g : gastos) {
                if (g.getTotalParcelas() == null || g.getParcelaAtual() == null) {
                    apenasParcelaAtual.add(g);
                } else if (manter.contains(g)) {
                    apenasParcelaAtual.add(g);
                }
            }
            gastos = apenasParcelaAtual;
        }

        // 2.1) aplica estornos/cancelamentos do CSV para remover compras equivalentes
        gastos = aplicarEstornosDoCsv(csvText, gastos);

        // 2.1.b) Remove as próprias linhas de estorno/cancelamento do preview
        {
            List<Gasto> filtradosLocal = new java.util.ArrayList<>();
            for (Gasto g : gastos) {
                if (!isEstornoOuCancelamentoDescricao(g)) {
                    filtradosLocal.add(g);
                }
            }
            gastos = filtradosLocal;
        }

        // 2.2) Se 'anchor=true' e vierem mes/ano, ancorar todos os itens (competência da fatura)
        if (Boolean.TRUE.equals(anchor) && mesNumero != null && anoPagamento != null) {
            for (Gasto g : gastos) {
                g.setMesNumero(mesNumero);
                g.setMesPagamento(String.valueOf(mesNumero));
                g.setAnoPagamento(anoPagamento);
            }
        }

        int totalLidas = gastos.size();

        // 3) Remover duplicados contra o banco (para refletir o que seria realmente salvo)
        List<Gasto> filtrados = gastoService.filtrarDuplicados(gastos);
        int importadas = filtrados.size();
        int ignoradas = totalLidas - importadas;

        // 4) Montar resumos em memória
        java.util.Map<String, ResumoMensalDTO> porMes = new java.util.LinkedHashMap<>();
        java.util.Map<String, CategoriaResumoDTO> porCategoria = new java.util.LinkedHashMap<>();
        double totalValor = 0.0;
        long qtdParcelados = 0L;

        for (Gasto g : filtrados) {
            int mes = g.getMesNumero() != null ? g.getMesNumero() : 0;
            int ano = g.getAnoPagamento() != null ? g.getAnoPagamento() : 0;
            String kMes = mes + "/" + ano;
            ResumoMensalDTO rm = porMes.get(kMes);
            if (rm == null) {
                rm = new ResumoMensalDTO(mes, ano, 0.0, 0.0, 0.0, 0L);
                porMes.put(kMes, rm);
            }
            double valorItem = (g.getValor() != null ? g.getValor() : 0.0);
            double novoTotal = (rm.getTotal() == null ? 0.0 : rm.getTotal()) + valorItem;
            rm.setTotal(novoTotal);
            rm.setTotalPago(0.0);
            rm.setTotalAberto(novoTotal);
            rm.setQuantidade((rm.getQuantidade() == null ? 0L : rm.getQuantidade()) + 1);
            totalValor += valorItem;
            if (g.getTotalParcelas() != null && g.getParcelaAtual() != null) {
                qtdParcelados++;
            }

            String cat = g.getCategoria() != null ? g.getCategoria() : "Sem Categoria";
            CategoriaResumoDTO rc = porCategoria.get(cat.toLowerCase());
            if (rc == null) {
                rc = new CategoriaResumoDTO(cat, 0.0, 0.0, 0.0, 0L);
                porCategoria.put(cat.toLowerCase(), rc);
            }
            double ct = (rc.getTotal() == null ? 0.0 : rc.getTotal()) + (g.getValor() != null ? g.getValor() : 0.0);
            rc.setTotal(ct);
            rc.setTotalPago(0.0);
            rc.setTotalAberto(ct);
            rc.setQuantidade((rc.getQuantidade() == null ? 0L : rc.getQuantidade()) + 1);
        }

        java.util.List<ResumoMensalDTO> resumoMeses = new java.util.ArrayList<>(porMes.values());
        resumoMeses.sort((a,b) -> {
            int c = Integer.compare(a.getAnoPagamento(), b.getAnoPagamento());
            if (c != 0) return c;
            return Integer.compare(a.getMesNumero(), b.getMesNumero());
        });

        java.util.List<CategoriaResumoDTO> resumoCategorias = new java.util.ArrayList<>(porCategoria.values());
        resumoCategorias.sort((a,b) -> Double.compare(b.getTotal(), a.getTotal()));

        long qtdAvista = importadas - qtdParcelados;

        // Top itens por valor
        List<Gasto> ordenados = new java.util.ArrayList<>(filtrados);
        ordenados.sort((a,b) -> Double.compare((b.getValor()!=null?b.getValor():0.0), (a.getValor()!=null?a.getValor():0.0)));
        java.util.List<com.uatts.controlegastos.dto.PreviewItemDTO> topItens = new java.util.ArrayList<>();
        for (int i = 0; i < Math.min(10, ordenados.size()); i++) {
            Gasto g = ordenados.get(i);
            topItens.add(new com.uatts.controlegastos.dto.PreviewItemDTO(
                    g.getDescricao(), g.getCategoria(), g.getValor(), g.getMesNumero(), g.getAnoPagamento(), g.getParcelaAtual(), g.getTotalParcelas()
            ));
        }

        PreviewResponseDTO resp = new PreviewResponseDTO(totalLidas, importadas, ignoradas, resumoMeses, resumoCategorias, totalValor, qtdAvista, qtdParcelados, topItens);
        return ResponseEntity.ok(resp);
    }

    // ----------------------- Helpers de Estorno/Cancelamento -----------------------
    private static boolean contemEstornoOuCancelamentoTitulo(String title) {
        if (title == null) return false;
        String t = title.toLowerCase(java.util.Locale.ROOT);
        return t.contains("estorno") ||
               t.contains("cancelamento") ||
               t.contains("cancelada") ||
               t.contains("cancelado") ||
               t.contains("compra cancelada") ||
               t.contains("reversao") ||
               t.contains("reversão");
    }

    private static String extrairDescricaoAlvoReembolso(String title) {
        if (title == null) return null;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(?i)estorno\\s+de\\s+\"([^\"]+)\"").matcher(title);
        if (m.find()) return m.group(1).trim();
        m = java.util.regex.Pattern.compile("(?i)estorno\\s+de\\s+(.+)").matcher(title);
        if (m.find()) return m.group(1).trim();
        m = java.util.regex.Pattern.compile("(?i)cancelamento\\s+de\\s+\"([^\"]+)\"").matcher(title);
        if (m.find()) return m.group(1).trim();
        m = java.util.regex.Pattern.compile("(?i)cancelamento\\s+de\\s+(.+)").matcher(title);
        if (m.find()) return m.group(1).trim();
        m = java.util.regex.Pattern.compile("(?i)compra\\s+cancelada\\s*[:\\-]?\\s*(.+)").matcher(title);
        if (m.find()) return m.group(1).trim();
        return null;
    }

    private static String normalizarDescricaoBase(String title) {
        if (title == null) return "";
        String semParcela = title.replaceAll("(?i)\\s*-\\s*Parcela\\s*\\d+\\/\\d+\\s*", " ");
        String s = semParcela.toLowerCase(java.util.Locale.ROOT).trim();
        s = s.replace('"', ' ').replace('\'', ' ');
        s = s.replaceAll("\\s+", " ");
        return s;
    }

    private static boolean equalsTol(double a, double b, double tol) {
        return Math.abs(a - b) <= tol;
    }

    private List<Gasto> aplicarEstornosDoCsv(String csvText, List<Gasto> gastos) {
        // Constrói mapa de reembolsos: descrição normalizada -> lista de valores (absolutos)
        java.util.Map<String, java.util.List<Double>> reembolsos = new java.util.HashMap<>();
        try (BufferedReader br = new BufferedReader(new StringReader(csvText))) {
            String line; boolean header = true;
            while ((line = br.readLine()) != null) {
                if (header) { header = false; continue; }
                if (line.isBlank()) continue;
                String[] cols = line.split(",", 3);
                if (cols.length < 3) continue;
                String titleOrig = cols[1] != null ? cols[1].trim() : "";
                String amountStr = cols[2] != null ? cols[2].trim() : "0";
                if (!contemEstornoOuCancelamentoTitulo(titleOrig)) continue;
                double valor;
                try { valor = Double.parseDouble(amountStr.replace(",", ".")); }
                catch (NumberFormatException e) { continue; }
                if (valor == 0.0) continue;
                String alvo = extrairDescricaoAlvoReembolso(titleOrig);
                String chave = normalizarDescricaoBase(alvo != null ? alvo : titleOrig);
                reembolsos.computeIfAbsent(chave, k -> new java.util.ArrayList<>()).add(Math.abs(valor));
            }
        } catch (Exception ignore) {}

        if (reembolsos.isEmpty()) return gastos;

        List<Gasto> result = new java.util.ArrayList<>();
        for (Gasto g : gastos) {
            String chaveCompra = normalizarDescricaoBase(g.getDescricao());
            java.util.List<Double> lista = reembolsos.get(chaveCompra);
            if (lista != null && !lista.isEmpty() && g.getValor() != null) {
                int idx = -1;
                for (int i = 0; i < lista.size(); i++) {
                    if (equalsTol(lista.get(i), g.getValor(), 0.01)) { idx = i; break; }
                }
                if (idx >= 0) {
                    lista.remove(idx);
                    if (lista.isEmpty()) reembolsos.remove(chaveCompra);
                    continue; // descarta compra por haver estorno correspondente
                }
            }
            result.add(g);
        }
        return result;
    }

    private static boolean isEstornoOuCancelamentoDescricao(Gasto g) {
        String d = g.getDescricao();
        if (d == null) return false;
        String t = d.toLowerCase(java.util.Locale.ROOT);
        return t.contains("estorno") ||
               t.contains("cancelamento") ||
               t.contains("cancelada") ||
               t.contains("cancelado") ||
               t.contains("compra cancelada") ||
               t.contains("reversao") ||
               t.contains("reversão");
    }

    @GetMapping
    public ResponseEntity<List<Gasto>> listarPorFiltros(
            @RequestParam String mesPagamento,
            @RequestParam Integer anoPagamento,
            @RequestParam(required = false) Boolean pago
    ) {
        List<Gasto> gastos = gastoService.buscarPorFiltros(mesPagamento, anoPagamento, pago);
        return ResponseEntity.ok(gastos);
    }

    @PatchMapping("/{id}/responsavel")
    public ResponseEntity<Gasto> atualizarResponsavel(@PathVariable Long id, @RequestBody String responsavel) {
        Gasto atualizado = gastoService.atualizarResponsavel(id, responsavel);
        return ResponseEntity.ok(atualizado);
    }

    @PatchMapping("/{id}/categoria")
    public ResponseEntity<Gasto> atualizarCategoria(@PathVariable Long id, @RequestBody String categoria) {
        Gasto atualizado = gastoService.atualizarCategoria(id, categoria);
        return ResponseEntity.ok(atualizado);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Gasto> atualizarParcialmente(@PathVariable Long id, @RequestBody @Valid AtualizacaoGastoDTO dto) {
        Gasto atualizado = gastoService.atualizarParcialmente(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    @GetMapping("/paginado")
    public ResponseEntity<Page<Gasto>> listarPaginado(
            @RequestParam Integer mesNumero,
            @RequestParam Integer anoPagamento,
            @RequestParam(required = false) Boolean pago,
            @RequestParam(required = false) String excludeCategoria,
            Pageable pageable // aceita ?page=&size=&sort=
    ) {
        Page<Gasto> page = (excludeCategoria != null && !excludeCategoria.isBlank())
                ? gastoService.buscarPaginadoExcluindoCategoria(mesNumero, anoPagamento, pago, excludeCategoria, pageable)
                : gastoService.buscarPaginado(mesNumero, anoPagamento, pago, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/por-categoria")
    public ResponseEntity<List<Gasto>> listarPorCategoria(
            @RequestParam Integer mesNumero,
            @RequestParam Integer anoPagamento,
            @RequestParam String categoria
    ) {
        List<Gasto> gastos = gastoService.buscarPorCategoria(mesNumero, anoPagamento, categoria);
        return ResponseEntity.ok(gastos);
    }

    @GetMapping("/resumo")
    public ResponseEntity<ResumoMensalDTO> obterResumoMensal(
            @RequestParam Integer mesNumero,
            @RequestParam Integer anoPagamento) {
        return ResponseEntity.ok(gastoService.obterResumoMensal(mesNumero, anoPagamento));
    }

    @GetMapping("/resumo-por-categoria")
    public ResponseEntity<List<CategoriaResumoDTO>> resumoPorCategoria(
            @RequestParam Integer mesNumero,
            @RequestParam Integer anoPagamento
    ) {
        List<CategoriaResumoDTO> resumo = gastoService.obterResumoPorCategoria(mesNumero, anoPagamento);
        return ResponseEntity.ok(resumo);
    }

    @PostMapping("/gastos")
    public ResponseEntity<Gasto> criar(@Valid @RequestBody CriarGastoDTO dto) {
        var gasto = gastoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(gasto);
    }



}
