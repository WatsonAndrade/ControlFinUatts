package com.uatts.controlegastos.repository;

import com.uatts.controlegastos.model.Cartao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartaoRepository extends JpaRepository<Cartao, Long> {
    List<Cartao> findByAtivoTrue();
}

