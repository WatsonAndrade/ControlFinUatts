package com.uatts.controlegastos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumoMensalDTO {
    private Integer mesNumero;
    private Integer anoPagamento;
    private Double total;
    private Double totalPago;
    private Double totalAberto;
    private Long quantidade;
}
