package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.service.ResumoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/resumo")
public class ResumoController {

    private final ResumoService resumoService;

    public ResumoController(ResumoService resumoService) {
        this.resumoService = resumoService;
    }

    @GetMapping("/{mes}")
    public ResponseEntity<Map<String, Double>> getResumoMensal(@PathVariable String mes) {
        Map<String, Double> resumo = resumoService.calcularResumo(mes);
        return ResponseEntity.ok(resumo);
    }
}