package com.uatts.controlegastos.dto;

import jakarta.validation.constraints.*;

public record CriarGastoDTO(
        @NotNull @Min(1) @Max(12) Integer mesNumero,
        @NotNull Integer anoPagamento,

        @NotBlank @Size(max = 50) String categoria,
        @NotNull @DecimalMin(value = "0.01") Double valor,

        @Size(max = 255) String descricao,
        Boolean pago,

        String mesPagamento,

        @Size(max = 50) String referenteA,
        @Min(1) Integer totalParcelas,
        @Min(1) Integer parcelaAtual
) {}
