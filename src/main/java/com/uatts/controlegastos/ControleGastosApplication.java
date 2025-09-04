package com.uatts.controlegastos;

import com.uatts.controlegastos.model.Gasto;
import com.uatts.controlegastos.repository.GastoRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class ControleGastosApplication {
    public static void main(String[] args) {
        SpringApplication.run(ControleGastosApplication.class, args);
    }

    // Backfill simples: renomeia categoria antiga "Importado" para "Cartão de Crédito"
    @Bean
    CommandLineRunner renameCategoria(GastoRepository repo) {
        return args -> {
            try {
                List<Gasto> antigos = repo.findByCategoriaIgnoreCase("Importado");
                if (!antigos.isEmpty()) {
                    for (Gasto g : antigos) {
                        g.setCategoria("Cartão de Crédito");
                    }
                    repo.saveAll(antigos);
                }
            } catch (Exception ignored) {}
        };
    }
}
