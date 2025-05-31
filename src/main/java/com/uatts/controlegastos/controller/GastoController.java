package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.model.Gasto;
import com.uatts.controlegastos.service.GastoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gastos")
public class GastoController {

    private final GastoService gastoService;

    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @PostMapping
    public ResponseEntity<Gasto> criarGasto(@RequestBody Gasto gasto) {
        Gasto novoGasto = gastoService.salvar(gasto);
        return ResponseEntity.ok(novoGasto);
    }

    @GetMapping("/mes/{mes}")
    public ResponseEntity<List<Gasto>> listarPorMes(@PathVariable String mes) {
        List<Gasto> gastos = gastoService.buscarPorMes(mes);
        return ResponseEntity.ok(gastos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarGasto(@PathVariable Long id) {
        gastoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pago")
    public ResponseEntity<Gasto> marcarComoPago(@PathVariable Long id) {
        Gasto gastoAtualizado = gastoService.marcarComoPago(id);
        return ResponseEntity.ok(gastoAtualizado);
    }
}