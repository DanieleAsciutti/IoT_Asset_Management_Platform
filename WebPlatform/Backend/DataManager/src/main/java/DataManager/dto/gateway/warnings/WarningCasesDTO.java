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

    List<? extends AnomalyWarningDTO> anomalyWarningDTOList;

    List<? extends RULWarningDTO> rulWarningDTOList;
}
