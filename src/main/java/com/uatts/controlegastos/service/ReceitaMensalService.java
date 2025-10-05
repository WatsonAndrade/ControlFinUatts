package com.uatts.controlegastos.service;

import com.uatts.controlegastos.model.ReceitaMensal;
import com.uatts.controlegastos.repository.ReceitaMensalRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReceitaMensalService {

    private final ReceitaMensalRepository repository;

    public ReceitaMensalService(ReceitaMensalRepository repository) {
        this.repository = repository;
    }

    public Optional<ReceitaMensal> buscar(int ano, int mes) {
        return repository.findByAnoAndMes(ano, mes);
    }

    @Transactional
    public ReceitaMensal salvarOuAtualizar(int ano, int mes, double valor) {
        ReceitaMensal receita = repository
            .findByAnoAndMes(ano, mes)
            .orElseGet(() -> {
                ReceitaMensal nova = new ReceitaMensal();
                nova.setAno(ano);
                nova.setMes(mes);
                return nova;
            });
        receita.setValor(valor);
        return repository.save(receita);
    }
}
