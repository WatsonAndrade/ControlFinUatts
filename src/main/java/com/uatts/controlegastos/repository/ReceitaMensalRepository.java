package com.uatts.controlegastos.repository;

import com.uatts.controlegastos.model.ReceitaMensal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceitaMensalRepository extends JpaRepository<ReceitaMensal, Long> {
    Optional<ReceitaMensal> findByAnoAndMesAndUsuarioId(Integer ano, Integer mes, String usuarioId);
}
