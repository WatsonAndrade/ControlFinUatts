package com.uatts.controlegastos.service;

import com.uatts.controlegastos.dto.AtualizacaoGastoDTO;
import com.uatts.controlegastos.dto.CategoriaResumoDTO;
import com.uatts.controlegastos.dto.CriarGastoDTO;
import com.uatts.controlegastos.dto.ResumoMensalDTO;
import com.uatts.controlegastos.model.Gasto;
import com.uatts.controlegastos.repository.GastoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.text.Normalizer;
import java.util.Locale;

@Service
public class GastoService {

    private final GastoRepository gastoRepository;
    private static final String CATEGORIA_CARTAO = "CartÃ£o de CrÃ©dito";

    public GastoService(GastoRepository gastoRepository) {
        this.gastoRepository = gastoRepository;
    }

    @Transactional
    public Gasto salvar(Gasto gasto) {
        prepararParaSalvar(gasto);
        return gastoRepository.save(gasto);
    }

    public List<Gasto> buscarPorMes(String mesPagamento) {
        return gastoRepository.findByMesPagamentoIgnoreCase(mesPagamento);
    }

    @Transactional
    public void deletar(Long id) {
        gastoRepository.deleteById(id);
    }

    @Transactional
    public Gasto marcarComoPago(Long id) {
        Gasto gasto = buscarOuLancarErro(id);

        gasto.setPago(true);
        return gastoRepository.save(gasto);
    }

    public void salvarTodos(List<Gasto> gastos) {
        if (gastos == null || gastos.isEmpty()) {
            return;
        }
        gastos.forEach(this::prepararParaSalvar);
        gastoRepository.saveAll(gastos);
    }

    private void prepararParaSalvar(Gasto gasto) {
        if (gasto == null) {
            return;
        }
        if (gasto.getCategoria() != null) {
            String categoria = gasto.getCategoria().trim();
            if (categoria.isEmpty()) {
                gasto.setCategoria(null);
            } else if (isCartaoCategoria(categoria)) {
                gasto.setCategoria(CATEGORIA_CARTAO);
            } else {
                gasto.setCategoria(categoria);
            }
        }
        if (gasto.getMesPagamento() != null) {
            String mes = gasto.getMesPagamento().trim();
            if (mes.isEmpty()) {
                gasto.setMesPagamento(null);
            } else {
                gasto.setMesPagamento(mes);
                if (gasto.getMesNumero() == null) {
                    Integer parsed = parseMes(mes);
                    if (parsed != null) {
                        gasto.setMesNumero(parsed);
                    }
                }
            }
        }
        if (gasto.getMesPagamento() == null && gasto.getMesNumero() != null) {
            gasto.setMesPagamento(String.valueOf(gasto.getMesNumero()));
        }
    }

    private boolean isCartaoCategoria(String categoria) {
        if (categoria == null) {
            return false;
        }
        return normalizeSemAcento(categoria).equals(normalizeSemAcento(CATEGORIA_CARTAO));
    }

    private String normalizeSemAcento(String valor) {
        if (valor == null) {
            return "";
        }
        String trimmed = valor.trim();
        String semAcento = Normalizer.normalize(trimmed, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return semAcento.toLowerCase(Locale.ROOT);
    }

    private Gasto buscarOuLancarErro(Long id) {
        return gastoRepository.findById(id).orElseThrow(() -> new RuntimeException("Gasto nÃ£o encontrado"));
    }

    public List<Gasto> filtrarDuplicados(List<Gasto> novosGastos) {
        // Agrupa por (mesNumero, ano) para buscar existentes em lote
        java.util.Map<String, List<Gasto>> porPeriodo = new java.util.HashMap<>();
        for (Gasto g : novosGastos) {
            Integer mes = g.getMesNumero();
            Integer ano = g.getAnoPagamento();
            String key = (mes == null ? "" : mes.toString()) + ":" + (ano == null ? "" : ano.toString());
            porPeriodo.computeIfAbsent(key, k -> new ArrayList<>()).add(g);
        }

        // ConstrÃ³i um Ã­ndice de chaves Ãºnicas a partir do banco por perÃ­odo
        java.util.Set<String> chavesExistentes = new java.util.HashSet<>();
        for (String k : porPeriodo.keySet()) {
            String[] parts = k.split(":", -1);
            Integer mes = parts[0].isEmpty() ? null : Integer.parseInt(parts[0]);
            Integer ano = parts[1].isEmpty() ? null : Integer.parseInt(parts[1]);
            if (mes == null || ano == null) continue;
            List<Gasto> existentes = gastoRepository.findByMesNumeroAndAnoPagamento(mes, ano);
            for (Gasto e : existentes) chavesExistentes.add(signature(e));
        }

        // Agora filtra novos removendo duplicados contra o banco e dentro do prÃ³prio lote
        java.util.Set<String> chavesNoLote = new java.util.HashSet<>();
        List<Gasto> result = new ArrayList<>();
        for (Gasto g : novosGastos) {
            String sig = signature(g);
            if (chavesExistentes.contains(sig)) {
                continue; // jÃ¡ existe no banco
            }
            if (chavesNoLote.contains(sig)) {
                continue; // duplicado dentro do mesmo CSV
            }
            chavesNoLote.add(sig);
            result.add(g);
        }
        return result;
    }

    private String normalize(String s) {
        if (s == null) return "";
        String t = s.trim().toLowerCase();
        t = t.replace('"', ' ').replace('\'', ' ');
        t = t.replaceAll("\\s+", " ");
        return t;
    }

    private String signature(Gasto g) {
        // chave: periodo + descricao normalizada + valor (2 casas) + parcela info
        int mes = g.getMesNumero() != null ? g.getMesNumero() : -1;
        int ano = g.getAnoPagamento() != null ? g.getAnoPagamento() : -1;
        String desc = normalize(g.getDescricao());
        long cents = Math.round((g.getValor() != null ? g.getValor() : 0.0) * 100.0);
        int parc = g.getParcelaAtual() != null ? g.getParcelaAtual() : 0;
        int tot = g.getTotalParcelas() != null ? g.getTotalParcelas() : 0;
        String uid = g.getUserId() != null ? g.getUserId() : "";
        return uid + ":" + mes + ":" + ano + ":" + desc + ":" + cents + ":" + parc + ":" + tot;
    }

    public List<Gasto> buscarPorFiltros(String mes, Integer ano, Boolean pago) {
        if (pago != null) {
            return gastoRepository.findByMesPagamentoIgnoreCaseAndAnoPagamentoAndPago(mes, ano, pago);
        } else {
            return gastoRepository.findByMesPagamentoIgnoreCaseAndAnoPagamento(mes, ano);
        }
    }

    @Transactional
    public Gasto atualizarResponsavel(Long id, String responsavel) {
        Gasto gasto = buscarOuLancarErro(id);

        gasto.setReferenteA(responsavel);
        return gastoRepository.save(gasto);
    }

    public Optional<Gasto> buscarPorId(Long id) {
        return gastoRepository.findById(id);
    }

    @Transactional
    public Gasto atualizarCategoria(Long id, String categoria) {
        Gasto gasto = buscarOuLancarErro(id);

        gasto.setCategoria(categoria);
        return gastoRepository.save(gasto);
    }

    @Transactional
    public Gasto atualizarParcialmente(Long id, AtualizacaoGastoDTO dto) {
        Gasto gasto = buscarOuLancarErro(id);

        if (dto.getMesPagamento() != null) {
            gasto.setMesPagamento(dto.getMesPagamento());
            Integer parsed = parseMes(dto.getMesPagamento());
            if (parsed != null) {
                gasto.setMesNumero(parsed);
            }
        }

        if (dto.getAnoPagamento() != null)   gasto.setAnoPagamento(dto.getAnoPagamento());
        if (dto.getReferenteA() != null)     gasto.setReferenteA(dto.getReferenteA());
        if (dto.getCategoria() != null)      gasto.setCategoria(dto.getCategoria());
        if (dto.getValor() != null)          gasto.setValor(dto.getValor());
        if (dto.getDescricao() != null)      gasto.setDescricao(dto.getDescricao());
        if (dto.getPago() != null)           gasto.setPago(dto.getPago());
        if (dto.getTotalParcelas() != null)  gasto.setTotalParcelas(dto.getTotalParcelas());
        if (dto.getParcelaAtual() != null)   gasto.setParcelaAtual(dto.getParcelaAtual());

        if (gasto.getMesPagamento() == null && gasto.getMesNumero() != null) {
            gasto.setMesPagamento(String.valueOf(gasto.getMesNumero()));
        }

        return gastoRepository.save(gasto);
    }

    public Page<Gasto> buscarPaginado(String userId, Integer mesNumero, Integer anoPagamento, Boolean pago, Pageable pageable) {
        if (pago != null) {
            return gastoRepository.findByMesNumeroAndAnoPagamentoAndPagoAndUserId(mesNumero, anoPagamento, pago, userId, pageable);
        }
        return gastoRepository.findByMesNumeroAndAnoPagamentoAndUserId(mesNumero, anoPagamento, userId, pageable);
    }

    public Page<Gasto> buscarPaginadoExcluindoCategoria(String userId, Integer mesNumero, Integer anoPagamento, Boolean pago, String excluirCategoria, Pageable pageable) {
        return gastoRepository.pageByPeriodoExcluindoCategoria(mesNumero, anoPagamento, pago, excluirCategoria, userId, pageable);
    }

    public List<Gasto> buscarPorCategoria(String userId, Integer mesNumero, Integer anoPagamento, String categoria) {
        return gastoRepository.findByMesNumeroAndAnoPagamentoAndCategoriaAndUserId(mesNumero, anoPagamento, categoria, userId);
    }

    public ResumoMensalDTO obterResumoMensal(String userId, Integer mesNumero, Integer anoPagamento) {
        double total      = gastoRepository.sumValorByMesNumeroEAnoAndUser(mesNumero, anoPagamento, userId);
        double totalPago  = gastoRepository.sumValorPagoByMesNumeroEAnoAndUser(mesNumero, anoPagamento, userId);
        double totalAberto = total - totalPago;
        long quantidade   = gastoRepository.countByMesNumeroEAnoAndUser(mesNumero, anoPagamento, userId);

        return new ResumoMensalDTO(mesNumero, anoPagamento, total, totalPago, totalAberto, quantidade);
    }

    public List<CategoriaResumoDTO> obterResumoPorCategoria(String userId, Integer mesNumero, Integer anoPagamento) {
        List<Object[]> rows = gastoRepository.resumoPorCategoriaUser(mesNumero, anoPagamento, userId);

        List<CategoriaResumoDTO> lista = new ArrayList<>();
        for (Object[] r : rows) {
            String categoria = (String) r[0];
            Double total = ((Number) r[1]).doubleValue();
            Double totalPago = ((Number) r[2]).doubleValue();
            Long quantidade = ((Number) r[3]).longValue();
            Double totalAberto = total - totalPago;

            lista.add(new CategoriaResumoDTO(categoria, total, totalPago, totalAberto, quantidade));
        }

        // opcional: ordenar por total desc
        lista.sort((a, b) -> Double.compare(b.getTotal(), a.getTotal()));
        return lista;
    }

    public Gasto criar(CriarGastoDTO dto, String userId) {
        var g = new Gasto();
        g.setMesNumero(dto.mesNumero());
        g.setAnoPagamento(dto.anoPagamento());
        g.setCategoria(dto.categoria());
        g.setValor(dto.valor());
        g.setDescricao(dto.descricao());
        g.setPago(Boolean.TRUE.equals(dto.pago()));
        g.setMesPagamento(dto.mesPagamento() != null ? dto.mesPagamento() : String.valueOf(dto.mesNumero()));
        g.setReferenteA(dto.referenteA());
        g.setTotalParcelas(dto.totalParcelas());
        g.setParcelaAtual(dto.parcelaAtual());
        g.setUserId(userId);
        return salvar(g);
    }

    private Integer parseMes(String mesPag) {
        if (mesPag == null) return null;
        String s = mesPag.trim().toLowerCase();

        // nÃºmero "7" ou "07"
        try {
            int n = Integer.parseInt(s);
            if (n >= 1 && n <= 12) return n;
        } catch (NumberFormatException ignore) {}

        // nomes pt-BR e EN (abreviados e completos)
        switch (s) {
            // 1
            case "jan": case "janeiro": case "january": return 1;
            // 2
            case "fev": case "fevereiro": case "feb": case "february": return 2;
            // 3
            case "mar": case "marco": case "marÃ§o": case "march": return 3;
            // 4
            case "abr": case "abril": case "apr": case "april": return 4;
            // 5
            case "mai": case "maio": case "may": return 5;
            // 6
            case "jun": case "junho": case "june": return 6;
            // 7
            case "jul": case "julho": case "july": return 7;
            // 8
            case "ago": case "agosto": case "aug": case "august": return 8;
            // 9
            case "set": case "setembro": case "sep": case "september": return 9;
            // 10
            case "out": case "outubro": case "oct": case "october": return 10;
            // 11
            case "nov": case "novembro": case "november": return 11;
            // 12
            case "dez": case "dezembro": case "dec": case "december": return 12;

            default: return null;
        }
    }

    @Transactional
    public int backfillMesAno() {
        var pendentes = gastoRepository.findByMesNumeroIsNullOrMesPagamentoIsNull();
        int updates = 0;

        for (var g : pendentes) {
            boolean mudou = false;

            // Se mesNumero estÃ¡ nulo, tenta derivar de mesPagamento
            if (g.getMesNumero() == null && g.getMesPagamento() != null) {
                Integer parsed = parseMes(g.getMesPagamento());
                if (parsed != null) {
                    g.setMesNumero(parsed);
                    mudou = true;
                }
            }

            // Se mesPagamento (String) estÃ¡ nulo mas hÃ¡ mesNumero, derive o texto
            if (g.getMesPagamento() == null && g.getMesNumero() != null) {
                g.setMesPagamento(String.valueOf(g.getMesNumero()));
                mudou = true;
            }

            if (mudou) updates++;
        }

        if (!pendentes.isEmpty()) {
            gastoRepository.saveAll(pendentes);
        }
        return updates;
    }


}


