package com.uatts.controlegastos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoriaResumoDTO {
    private String categoria;
    private Double total;        // soma de todos os gastos da categoria
    private Double totalPago;    // soma dos pagos
    private Double totalAberto;  // total - totalPago
    private Long quantidade;     // quantos lançamentos na categoria
}