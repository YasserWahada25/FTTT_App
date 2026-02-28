package FTTApp.Terrain_tennis_service;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Terrain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;           // "Court Central"

    private String surface;       // "Terre battue" / "Gazon" / "Dur"

    private String localisation;  // "Tunis, Lac 1"

    private boolean disponible;   // true / false

    private double prixParHeure;  // 50.0 DT

    private String image;         // URL image du terrain
}