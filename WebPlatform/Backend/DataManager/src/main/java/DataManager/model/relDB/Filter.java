package DataManager.model.relDB;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "filters")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Filter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_level1_id")
    private Filter parentLevel1;

    @ManyToOne
    @JoinColumn(name = "parent_level2_id")
    private Filter parentLevel2;

    public Filter(String name, Filter level1, Filter level2) {
        this.name = name;
        this.parentLevel1 = level1;
        this.parentLevel2 = level2;
    }

    @PrePersist
    @PreUpdate
    public void validateLevel3Consistency() {
        // Se parentLevel1 e parentLevel2 non sono nulli, allora parentLevel2.parentLevel1 deve essere uguale a parentLevel1
        if (this.parentLevel1 != null && this.parentLevel2 != null) {
            if (!this.parentLevel2.parentLevel1.equals(this.parentLevel1)) {
                throw new IllegalStateException("parentLevel2 must have the same parentLevel1 as the current entity.");
            }
        }
    }
}
