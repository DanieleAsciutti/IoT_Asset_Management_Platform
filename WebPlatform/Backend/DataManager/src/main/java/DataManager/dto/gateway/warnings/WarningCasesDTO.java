package DataManager.dto.gateway.warnings;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class WarningCasesDTO {

    List<AnomalyWarningDTO> anomalyWarningDTOList;

    List<RLUWarningDTO> rluWarningDTOList;
}
