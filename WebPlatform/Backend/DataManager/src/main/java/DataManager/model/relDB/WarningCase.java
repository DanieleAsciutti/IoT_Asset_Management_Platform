package DataManager.model.relDB;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "warning_case")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WarningCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_title", nullable = false)
    private String caseTitle;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "date_time", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "level_1", nullable = false)
    private String level1;

    @Column(name = "level_2", nullable = false)
    private String level2;

    @Column(name = "level_3", nullable = false)
    private String level3;


    public WarningCase(String caseTitle, String deviceId, LocalDateTime timestamp, String level1, String level2, String level3) {
        this.caseTitle = caseTitle;
        this.deviceId = deviceId;
        this.timestamp = timestamp;
        this.level1 = level1;
        this.level2 = level2;
        this.level3 = level3;
    }

}
