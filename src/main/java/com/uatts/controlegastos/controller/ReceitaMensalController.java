package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.dto.AtualizaReceitaMensalRequest;
import com.uatts.controlegastos.dto.ReceitaMensalResponse;
import com.uatts.controlegastos.model.ReceitaMensal;
import com.uatts.controlegastos.service.ReceitaMensalService;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
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

    private String getUsuarioAtual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return null;
    }

    @GetMapping("/{ano}/{mes}")
    public ResponseEntity<ReceitaMensalResponse> buscar(@PathVariable int ano, @PathVariable int mes) {
        String usuario = getUsuarioAtual();
        if (usuario == null) {
            return ResponseEntity.status(401).build();
        }
        Optional<ReceitaMensal> receita = service.buscar(usuario, ano, mes);
        double valor = receita.map(ReceitaMensal::getValor).orElse(0.0);
        return ResponseEntity.ok(new ReceitaMensalResponse(ano, mes, valor));
    }

    @PutMapping("/{ano}/{mes}")
    public ResponseEntity<ReceitaMensalResponse> atualizar(
        @PathVariable int ano,
        @PathVariable int mes,
        @Valid @RequestBody AtualizaReceitaMensalRequest request
    ) {
        String usuario = getUsuarioAtual();
        if (usuario == null) {
            return ResponseEntity.status(401).build();
        }
        ReceitaMensal receita = service.salvarOuAtualizar(usuario, ano, mes, request.valor());
        return ResponseEntity.ok(new ReceitaMensalResponse(receita.getAno(), receita.getMes(), receita.getValor()));
    }
}
