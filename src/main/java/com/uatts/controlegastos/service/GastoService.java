package com.uatts.controlegastos.service;

import com.uatts.controlegastos.dto.AtualizacaoGastoDTO;
import com.uatts.controlegastos.model.Gasto;
import com.uatts.controlegastos.repository.GastoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (dto.getMesPagamento() != null) gasto.setMesPagamento(dto.getMesPagamento());
        if (dto.getAnoPagamento() != null) gasto.setAnoPagamento(dto.getAnoPagamento());
        if (dto.getReferenteA() != null) gasto.setReferenteA(dto.getReferenteA());
        if (dto.getCategoria() != null) gasto.setCategoria(dto.getCategoria());
        if (dto.getValor() != null) gasto.setValor(dto.getValor());
        if (dto.getDescricao() != null) gasto.setDescricao(dto.getDescricao());
        if (dto.getPago() != null) gasto.setPago(dto.getPago());
        if (dto.getTotalParcelas() != null) gasto.setTotalParcelas(dto.getTotalParcelas());
        if (dto.getParcelaAtual() != null) gasto.setParcelaAtual(dto.getParcelaAtual());

        return gastoRepository.save(gasto);
    }



}