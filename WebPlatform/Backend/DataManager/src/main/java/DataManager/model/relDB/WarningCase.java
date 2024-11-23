package DataManager.model.relDB;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

//@Entity
//@Table(name = "warning_case")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@MappedSuperclass
public class WarningCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_title", nullable = false)
    private String caseTitle;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "creation_date_time", nullable = false)
    private LocalDateTime creation_date_time;

    @Column(name = "processed_date_time")
    @ColumnDefault("null")
    private LocalDateTime processed_date_time;

    @Column(name = "level_1", nullable = false)
    private String level1;

    @Column(name = "level_2", nullable = false)
    private String level2;

    @Column(name = "level_3", nullable = false)
    private String level3;

    @Column(name = "processed")
    private Boolean processed;

    @Column(name = "note")
    private String note;

    @Column(name = "assigned_to")
    private String assignedTo;

    public WarningCase(String caseTitle, String deviceId, LocalDateTime creation_date_time, String level1, String level2, String level3) {
        this.caseTitle = caseTitle;
        this.deviceId = deviceId;
        this.creation_date_time = creation_date_time;
        this.level1 = level1;
        this.level2 = level2;
        this.level3 = level3;
        this.processed = false;
    }

}
