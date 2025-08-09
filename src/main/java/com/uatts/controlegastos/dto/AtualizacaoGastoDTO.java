package com.uatts.controlegastos.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AtualizacaoGastoDTO {

    @Pattern(regexp = "^(?:[1-9]|1[0-2]|jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço|co)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)$",
             flags = { Pattern.Flag.CASE_INSENSITIVE },
             message = "Use 1–12 ou o nome do mês (ex.: 7, jul, julho).")
    private String mesPagamento;

    @Min(value = 2000, message = "O ano deve ser no mínimo 2000.")
    @Max(value = 2100, message = "O ano deve ser no máximo 2100.")
    private Integer anoPagamento;

    @Size(max = 50, message = "O campo referenteA deve ter no máximo 50 caracteres.")
    private String referenteA;

    @Size(max = 50, message = "O campo categoria deve ter no máximo 50 caracteres.")
    private String categoria;

    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
    private Double valor;

    @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres.")
    private String descricao;

    private Boolean pago;

    @Min(value = 1, message = "O total de parcelas deve ser no mínimo 1.")
    private Integer totalParcelas;

    @Min(value = 1, message = "A parcela atual deve ser no mínimo 1.")
    private Integer parcelaAtual;
}
