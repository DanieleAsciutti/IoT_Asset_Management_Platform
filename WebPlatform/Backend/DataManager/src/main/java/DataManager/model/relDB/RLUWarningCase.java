package DataManager.model.relDB;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rlu_warning_case")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RLUWarningCase extends WarningCase{

    @Column(name = "device_rlu", nullable = false)
    private String device_rlu;

    @Column(name = "is_rlu_correct")
    private Boolean is_rlu_correct;

    @Column(name = "technician_rlu")
    private String technician_rlu;

    public RLUWarningCase(String caseTitle, String deviceId, LocalDateTime timestamp, String level1, String level2, String level3, String device_rlu) {
        super(caseTitle, deviceId, timestamp, level1, level2, level3);
        this.device_rlu = device_rlu;
    }


}
