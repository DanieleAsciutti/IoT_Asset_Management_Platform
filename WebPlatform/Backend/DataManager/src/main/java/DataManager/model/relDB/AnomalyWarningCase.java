package DataManager.model.relDB;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "anomaly_warning_case")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class AnomalyWarningCase extends WarningCase{

    @Column(name = "description", nullable = false)
    private String anomaly_description;

    @Column(name = "is_anomaly_correct")
    private Boolean is_anomaly_correct;

    @Column(name = "technician_anomaly")
    private String technician_anomaly;

    public AnomalyWarningCase(String caseTitle, String deviceId, LocalDateTime timestamp, String level1, String level2, String level3, String anomaly_description) {
        super(caseTitle, deviceId, timestamp, level1, level2, level3);
        this.anomaly_description = anomaly_description;
    }
}
