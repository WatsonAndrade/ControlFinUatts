package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.dto.AtualizaReceitaMensalRequest;
import com.uatts.controlegastos.dto.ReceitaMensalResponse;
import com.uatts.controlegastos.model.ReceitaMensal;
import com.uatts.controlegastos.service.ReceitaMensalService;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/receitas-mensais")
public class ReceitaMensalController {

    private final ReceitaMensalService service;

    public ReceitaMensalController(ReceitaMensalService service) {
        this.service = service;
    }

    @GetMapping("/{ano}/{mes}")
    public ResponseEntity<ReceitaMensalResponse> buscar(@PathVariable int ano, @PathVariable int mes) {
        Optional<ReceitaMensal> receita = service.buscar(ano, mes);
        double valor = receita.map(ReceitaMensal::getValor).orElse(0.0);
        return ResponseEntity.ok(new ReceitaMensalResponse(ano, mes, valor));
    }

    @PutMapping("/{ano}/{mes}")
    public ResponseEntity<ReceitaMensalResponse> atualizar(
        @PathVariable int ano,
        @PathVariable int mes,
        @Valid @RequestBody AtualizaReceitaMensalRequest request
    ) {
        ReceitaMensal receita = service.salvarOuAtualizar(ano, mes, request.valor());
        return ResponseEntity.ok(new ReceitaMensalResponse(receita.getAno(), receita.getMes(), receita.getValor()));
    }
}
