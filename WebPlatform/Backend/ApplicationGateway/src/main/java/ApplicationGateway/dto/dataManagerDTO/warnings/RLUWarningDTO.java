package ApplicationGateway.dto.dataManagerDTO.warnings;

import lombok.*;

import java.time.LocalDateTime;


@Data
@Builder
@AllArgsConstructor
@ToString
@Getter
public class RLUWarningDTO{

    private Long id;

    private String caseTitle;

    private String deviceId;

    private String deviceName;

    private LocalDateTime timestamp;

    private String level1;

    private String level2;

    private String level3;

    private String assignedTo;

    private String device_rlu;
}
