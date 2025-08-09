package com.uatts.controlegastos.model;

import com.uatts.controlegastos.listener.GastoListener;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table
@EntityListeners(GastoListener.class)
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mesPagamento;

    private Integer mesNumero;

    @Column(nullable = false)
    private Integer anoPagamento;

    @Column(nullable = true)
    private String referenteA;

    @Column(nullable = false)
    private String categoria;

    @Column(nullable = false)
    private Double valor;

    private String descricao;

    @Column
    private boolean pago = false;

    @Column
    private Integer totalParcelas;

    @Column
    private Integer parcelaAtual;
}