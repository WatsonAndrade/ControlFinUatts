package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.model.Receita;
import com.uatts.controlegastos.service.ReceitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receitas")
public class ReceitaController {

    private final ReceitaService receitaService;

    public ReceitaController(ReceitaService receitaService) {
        this.receitaService = receitaService;
    }

    @PostMapping
    public ResponseEntity<Receita> criarReceita(@RequestBody Receita receita) {
        Receita novaReceita = receitaService.salvar(receita);
        return ResponseEntity.ok(novaReceita);
    }

    @GetMapping("/mes/{mes}")
    public ResponseEntity<List<Receita>> listarPorMes(@PathVariable String mes) {
        List<Receita> receitas = receitaService.buscarPorMes(mes);
        return ResponseEntity.ok(receitas);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarReceita(@PathVariable Long id) {
        receitaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}