package com.uatts.controlegastos.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
public class Receita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mes;

    private String descricao;

    @Column(nullable = false)
    private Double valor;

    // Getters/Setters explícitos para evitar depender do Lombok no build
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMes() { return mes; }
    public void setMes(String mes) { this.mes = mes; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }
}
