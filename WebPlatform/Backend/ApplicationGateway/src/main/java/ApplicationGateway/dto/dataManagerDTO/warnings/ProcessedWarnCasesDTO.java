package ApplicationGateway.dto.dataManagerDTO.warnings;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class ProcessedWarnCasesDTO {

    List<ProcessedAnomalyWarningDTO> anomalyWarningDTOList;

    List<ProcessedRULWarningDTO> rulWarningDTOList;
}
