package com.uatts.controlegastos;

import com.uatts.controlegastos.model.Gasto;
import com.uatts.controlegastos.service.CsvParserService;

import java.util.List;

public class CsvParserTest {
    public static void main(String[] args) {
        String csv = """
            date,title,amount
            2025-07-03,Mlp *Magalu-Kabum - Parcela 3/10,150.86
            2025-07-04,Amazon,99.99
            """;

        CsvParserService parser = new CsvParserService();
        List<Gasto> gastos = parser.parse(csv);

        for (Gasto g : gastos) {
            System.out.println(g);
        }
    }
}
