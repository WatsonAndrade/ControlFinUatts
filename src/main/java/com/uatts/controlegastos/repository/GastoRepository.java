package com.uatts.controlegastos.repository;

import com.uatts.controlegastos.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
        List<Gasto> findByMesIgnoreCase(String mes);

        @Query("SELECT SUM(g.valor) FROM Gasto g WHERE LOWER(g.mes) = LOWER(:mes)")
        Optional<Double> sumValorByMes(@Param("mes") String mes);
}