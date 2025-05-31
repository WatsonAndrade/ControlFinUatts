package com.uatts.controlegastos.service;

import com.uatts.controlegastos.model.Receita;
import com.uatts.controlegastos.repository.ReceitaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReceitaService {

    private final ReceitaRepository receitaRepository;

    public ReceitaService(ReceitaRepository receitaRepository) {
        this.receitaRepository = receitaRepository;
    }

    @Transactional
    public Receita salvar(Receita receita) {
        return receitaRepository.save(receita);
    }

    public List<Receita> buscarPorMes(String mes) {
        return receitaRepository.findByMesIgnoreCase(mes);
    }

    @Transactional
    public void deletar(Long id) {
        receitaRepository.deleteById(id);
    }
}