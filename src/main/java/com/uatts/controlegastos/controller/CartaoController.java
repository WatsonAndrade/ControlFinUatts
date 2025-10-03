package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.model.Cartao;
import com.uatts.controlegastos.repository.CartaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cartoes")
public class CartaoController {

    private final CartaoRepository repo;

    public CartaoController(CartaoRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Cartao> listar() { return repo.findAll(); }

    @GetMapping("/ativos")
    public List<Cartao> listarAtivos() { return repo.findByAtivoTrue(); }

    @PostMapping
    public ResponseEntity<Cartao> criar(@RequestBody Cartao c) {
        if (c.getDiaFechamento() == null || c.getDiaFechamento() < 1 || c.getDiaFechamento() > 31) {
            return ResponseEntity.badRequest().build();
        }
        c.setId(null);
        return ResponseEntity.ok(repo.save(c));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Cartao> atualizar(@PathVariable Long id, @RequestBody Cartao parcial) {
        return repo.findById(id)
                .map(c -> {
                    if (parcial.getNome() != null) c.setNome(parcial.getNome());
                    if (parcial.getDiaFechamento() != null) c.setDiaFechamento(parcial.getDiaFechamento());
                    if (parcial.getPalavrasChave() != null) c.setPalavrasChave(parcial.getPalavrasChave());
                    c.setAtivo(parcial.isAtivo());
                    return ResponseEntity.ok(repo.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

