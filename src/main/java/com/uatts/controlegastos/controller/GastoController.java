package com.uatts.controlegastos.controller;

import com.uatts.controlegastos.dto.AtualizacaoGastoDTO;
import com.uatts.controlegastos.dto.CategoriaResumoDTO;
import com.uatts.controlegastos.dto.CriarGastoDTO;
import com.uatts.controlegastos.dto.ImportacaoResponseDTO;
import com.uatts.controlegastos.dto.ResumoMensalDTO;
import com.uatts.controlegastos.model.Gasto;
import com.uatts.controlegastos.service.CsvParserService;
import com.uatts.controlegastos.service.GastoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/gastos")
public class GastoController {

    private final GastoService gastoService;
    private final CsvParserService csvParserService;

    public GastoController(GastoService gastoService, CsvParserService csvParserService) {
        this.gastoService = gastoService;
        this.csvParserService = csvParserService;
    }

    @PostMapping
    public ResponseEntity<Gasto> criarGasto(@RequestBody Gasto gasto) {
        Gasto novoGasto = gastoService.salvar(gasto);
        return ResponseEntity.ok(novoGasto);
    }

    @GetMapping("/mes/{mesPagamento}")
    public ResponseEntity<List<Gasto>> listarPorMes(@PathVariable String mesPagamento) {
        List<Gasto> gastos = gastoService.buscarPorMes(mesPagamento);
        return ResponseEntity.ok(gastos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarGasto(@PathVariable Long id) {
        gastoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pago")
    public ResponseEntity<Void> atualizarStatusPago(@PathVariable Long id, @RequestBody Boolean pago) {
        Optional<Gasto> optionalGasto = gastoService.buscarPorId(id);
        if (optionalGasto.isPresent()) {
            Gasto gasto = optionalGasto.get();
            gasto.setPago(pago);
            gastoService.salvar(gasto);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/importar")
    public ResponseEntity<Void> importarCSV(@RequestBody List<Gasto> gastos) {
        gastoService.salvarTodos(gastos);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/importar-csv", consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<ImportacaoResponseDTO> importarArquivo(@RequestBody String csvText) {
        List<Gasto> gastos = csvParserService.parse(csvText);
        int totalLidas = gastos.size();

        List<Gasto> filtrados = gastoService.filtrarDuplicados(gastos);
        gastoService.salvarTodos(filtrados);

        int importadas = filtrados.size();
        int ignoradas = totalLidas - importadas;

        ImportacaoResponseDTO resposta = new ImportacaoResponseDTO(totalLidas, importadas, ignoradas);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping
    public ResponseEntity<List<Gasto>> listarPorFiltros(
            @RequestParam String mesPagamento,
            @RequestParam Integer anoPagamento,
            @RequestParam(required = false) Boolean pago
    ) {
        List<Gasto> gastos = gastoService.buscarPorFiltros(mesPagamento, anoPagamento, pago);
        return ResponseEntity.ok(gastos);
    }

    @PatchMapping("/{id}/responsavel")
    public ResponseEntity<Gasto> atualizarResponsavel(@PathVariable Long id, @RequestBody String responsavel) {
        Gasto atualizado = gastoService.atualizarResponsavel(id, responsavel);
        return ResponseEntity.ok(atualizado);
    }

    @PatchMapping("/{id}/categoria")
    public ResponseEntity<Gasto> atualizarCategoria(@PathVariable Long id, @RequestBody String categoria) {
        Gasto atualizado = gastoService.atualizarCategoria(id, categoria);
        return ResponseEntity.ok(atualizado);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Gasto> atualizarParcialmente(@PathVariable Long id, @RequestBody @Valid AtualizacaoGastoDTO dto) {
        Gasto atualizado = gastoService.atualizarParcialmente(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    @GetMapping("/paginado")
    public ResponseEntity<Page<Gasto>> listarPaginado(
            @RequestParam Integer mesNumero,
            @RequestParam Integer anoPagamento,
            @RequestParam(required = false) Boolean pago,
            @RequestParam(required = false) String excludeCategoria,
            Pageable pageable // aceita ?page=&size=&sort=
    ) {
        Page<Gasto> page = (excludeCategoria != null && !excludeCategoria.isBlank())
                ? gastoService.buscarPaginadoExcluindoCategoria(mesNumero, anoPagamento, pago, excludeCategoria, pageable)
                : gastoService.buscarPaginado(mesNumero, anoPagamento, pago, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/por-categoria")
    public ResponseEntity<List<Gasto>> listarPorCategoria(
            @RequestParam Integer mesNumero,
            @RequestParam Integer anoPagamento,
            @RequestParam String categoria
    ) {
        List<Gasto> gastos = gastoService.buscarPorCategoria(mesNumero, anoPagamento, categoria);
        return ResponseEntity.ok(gastos);
    }

    @GetMapping("/resumo")
    public ResponseEntity<ResumoMensalDTO> obterResumoMensal(
            @RequestParam Integer mesNumero,
            @RequestParam Integer anoPagamento) {
        return ResponseEntity.ok(gastoService.obterResumoMensal(mesNumero, anoPagamento));
    }

    @GetMapping("/resumo-por-categoria")
    public ResponseEntity<List<CategoriaResumoDTO>> resumoPorCategoria(
            @RequestParam Integer mesNumero,
            @RequestParam Integer anoPagamento
    ) {
        List<CategoriaResumoDTO> resumo = gastoService.obterResumoPorCategoria(mesNumero, anoPagamento);
        return ResponseEntity.ok(resumo);
    }

    @PostMapping("/gastos")
    public ResponseEntity<Gasto> criar(@Valid @RequestBody CriarGastoDTO dto) {
        var gasto = gastoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(gasto);
    }



}
