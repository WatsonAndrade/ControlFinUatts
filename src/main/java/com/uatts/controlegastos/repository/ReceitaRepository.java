package com.uatts.controlegastos.repository;

import com.uatts.controlegastos.model.Receita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReceitaRepository extends JpaRepository<Receita, Long> {
    List<Receita> findByMesIgnoreCase(String mes);

    @Query("SELECT SUM(r.valor) FROM Receita r WHERE r.mes = :mes")
    Double sumValorByMes(@Param("mes") String mes);
}