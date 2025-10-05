package com.uatts.controlegastos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record AtualizaReceitaMensalRequest(@NotNull @PositiveOrZero Double valor) {}
