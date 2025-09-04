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

@Service
public class GastoService {

    private final GastoRepository gastoRepository;

    public GastoService(GastoRepository gastoRepository) {
        this.gastoRepository = gastoRepository;
    }

    @Transactional
    public Gasto salvar(Gasto gasto) {
        // Validação adicional pode ser adicionada aqui
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
        gastoRepository.saveAll(gastos);
    }

    private Gasto buscarOuLancarErro(Long id) {
        return gastoRepository.findById(id).orElseThrow(() -> new RuntimeException("Gasto não encontrado"));
    }

    public List<Gasto> filtrarDuplicados(List<Gasto> novosGastos) {
        List<Gasto> gastosFiltrados = new ArrayList<>();

        for (Gasto novo : novosGastos) {
            List<Gasto> existentes = gastoRepository.findByMesPagamentoIgnoreCaseAndAnoPagamento(
                    novo.getMesPagamento(), novo.getAnoPagamento()
            );

            boolean duplicado = existentes.stream().anyMatch(existente ->
                    existente.getDescricao().equalsIgnoreCase(novo.getDescricao()) &&
                            existente.getParcelaAtual() != null &&
                            existente.getParcelaAtual().equals(novo.getParcelaAtual()) &&
                            existente.getTotalParcelas() != null &&
                            existente.getTotalParcelas().equals(novo.getTotalParcelas())
            );

            if (!duplicado) {
                gastosFiltrados.add(novo);
            }
        }

        return gastosFiltrados;
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

    public Page<Gasto> buscarPaginado(Integer mesNumero, Integer anoPagamento, Boolean pago, Pageable pageable) {
        if (pago != null) {
            return gastoRepository.findByMesNumeroAndAnoPagamentoAndPago(mesNumero, anoPagamento, pago, pageable);
        }
        return gastoRepository.findByMesNumeroAndAnoPagamento(mesNumero, anoPagamento, pageable);
    }

    public Page<Gasto> buscarPaginadoExcluindoCategoria(Integer mesNumero, Integer anoPagamento, Boolean pago, String excluirCategoria, Pageable pageable) {
        return gastoRepository.pageByPeriodoExcluindoCategoria(mesNumero, anoPagamento, pago, excluirCategoria, pageable);
    }

    public List<Gasto> buscarPorCategoria(Integer mesNumero, Integer anoPagamento, String categoria) {
        return gastoRepository.findByMesNumeroAndAnoPagamentoAndCategoria(mesNumero, anoPagamento, categoria);
    }

    public ResumoMensalDTO obterResumoMensal(Integer mesNumero, Integer anoPagamento) {
        double total      = gastoRepository.sumValorByMesNumeroEAno(mesNumero, anoPagamento);
        double totalPago  = gastoRepository.sumValorPagoByMesNumeroEAno(mesNumero, anoPagamento);
        double totalAberto = total - totalPago;
        long quantidade   = gastoRepository.countByMesNumeroEAno(mesNumero, anoPagamento);

        return new ResumoMensalDTO(mesNumero, anoPagamento, total, totalPago, totalAberto, quantidade);
    }

    public List<CategoriaResumoDTO> obterResumoPorCategoria(Integer mesNumero, Integer anoPagamento) {
        List<Object[]> rows = gastoRepository.resumoPorCategoria(mesNumero, anoPagamento);

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

    public Gasto criar(CriarGastoDTO dto) {
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
        return gastoRepository.save(g);
    }

    private Integer parseMes(String mesPag) {
        if (mesPag == null) return null;
        String s = mesPag.trim().toLowerCase();

        // número "7" ou "07"
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
            case "mar": case "marco": case "março": case "march": return 3;
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

            // Se mesNumero está nulo, tenta derivar de mesPagamento
            if (g.getMesNumero() == null && g.getMesPagamento() != null) {
                Integer parsed = parseMes(g.getMesPagamento());
                if (parsed != null) {
                    g.setMesNumero(parsed);
                    mudou = true;
                }
            }

            // Se mesPagamento (String) está nulo mas há mesNumero, derive o texto
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
