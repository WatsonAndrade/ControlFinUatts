package com.uatts.controlegastos.service;

import com.uatts.controlegastos.model.Gasto;
import com.uatts.controlegastos.repository.GastoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        Gasto gasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto não encontrado"));

        gasto.setPago(true);
        return gastoRepository.save(gasto);
    }

    public void salvarTodos(List<Gasto> gastos) {
        gastoRepository.saveAll(gastos);
    }

}