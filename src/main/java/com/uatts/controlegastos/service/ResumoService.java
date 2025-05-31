package com.uatts.controlegastos.service;

import com.uatts.controlegastos.repository.GastoRepository;
import com.uatts.controlegastos.repository.ReceitaRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResumoService {

    private final GastoRepository gastoRepository;
    private final ReceitaRepository receitaRepository;

    public ResumoService(GastoRepository gastoRepository,
                         ReceitaRepository receitaRepository) {
        this.gastoRepository = gastoRepository;
        this.receitaRepository = receitaRepository;
    }

    public Map<String, Double> calcularResumo(String mes) {
        /*Double totalGastos = gastoRepository.sumValorByMes(mes);
        Double totalReceitas = receitaRepository.sumValorByMes(mes);

        if (totalGastos == null) totalGastos = 0.0;
        if (totalReceitas == null) totalReceitas = 0.0;

        Map<String, Double> resumo = new HashMap<>();
        resumo.put("totalGastos", totalGastos);
        resumo.put("totalReceitas", totalReceitas);
        resumo.put("saldo", totalReceitas - totalGastos);

        return resumo;*/
        return null;
    }
}