package com.uatts.controlegastos.service;

import com.uatts.controlegastos.model.Gasto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CsvParserService {

    public List<Gasto> parse(String csvText) {
        List<Gasto> gastos = new ArrayList<>();

        String[] linhas = csvText.split("\\r?\\n");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Pattern parcelaPattern = Pattern.compile("(?i).*parcela\\s*(\\d+)/(\\d+).*");

        for (int i = 1; i < linhas.length; i++) {
            String linha = linhas[i].trim();
            if (linha.isEmpty()) continue;

            String[] partes = linha.split(",");

            if (partes.length < 3) continue;

            String dataStr = partes[0].trim();
            String tituloOriginal = partes[1].trim();
            String valorStr = partes[2].trim();

            LocalDate data = LocalDate.parse(dataStr, formatter);
            Double valor = Double.parseDouble(valorStr);
            String descricao = tituloOriginal;

            int parcelaAtual = 1;
            int totalParcelas = 1;

            Matcher matcher = parcelaPattern.matcher(tituloOriginal);
            if (matcher.find()) {
                parcelaAtual = Integer.parseInt(matcher.group(1));
                totalParcelas = Integer.parseInt(matcher.group(2));
                descricao = tituloOriginal.replaceAll("(?i) - Parcela \\d+/\\d+", "").trim();
            }

            for (int p = parcelaAtual; p <= totalParcelas; p++) {
                Gasto gasto = new Gasto();
                LocalDate dataParcela = data.plusMonths(p - parcelaAtual);
                gasto.setMesPagamento(dataParcela.getMonth().name());
                gasto.setAnoPagamento(dataParcela.getYear());
                gasto.setDescricao(descricao);
                gasto.setValor(valor);
                gasto.setPago(false);
                gasto.setParcelaAtual(p);
                gasto.setTotalParcelas(totalParcelas);
                gasto.setCategoria("Importado");
                gasto.setReferenteA("Pessoal");

                gastos.add(gasto);
            }
        }
        return gastos;
    }
}