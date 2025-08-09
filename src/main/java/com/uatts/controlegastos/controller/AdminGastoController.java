package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.service.GastoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminGastoController {

    private final GastoService gastoService;

    public AdminGastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @PostMapping("/backfill-mes-ano")
    public ResponseEntity<Map<String, Object>> backfillMesAno() {
        int updated = gastoService.backfillMesAno();
        return ResponseEntity.ok(Map.of(
                "updated", updated
        ));
    }
}