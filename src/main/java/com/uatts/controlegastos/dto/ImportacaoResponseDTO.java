package com.uatts.controlegastos.dto;

public class ImportacaoResponseDTO {
    private int totalLidas;
    private int importadas;
    private int ignoradas;

    public ImportacaoResponseDTO(int totalLidas, int importadas, int ignoradas) {
        this.totalLidas = totalLidas;
        this.importadas = importadas;
        this.ignoradas = ignoradas;
    }

    // Getters e setters
    public int getTotalLidas() { return totalLidas; }
    public int getImportadas() { return importadas; }
    public int getIgnoradas() { return ignoradas; }

    public void setTotalLidas(int totalLidas) { this.totalLidas = totalLidas; }
    public void setImportadas(int importadas) { this.importadas = importadas; }
    public void setIgnoradas(int ignoradas) { this.ignoradas = ignoradas; }
}