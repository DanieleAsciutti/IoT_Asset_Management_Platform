package ApplicationGateway.dto.dataManagerDTO.warnings;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class WarnCasesDTO {

    List<AnomalyWarningDTO> anomalyWarningDTOList;

    List<RLUWarningDTO> rluWarningDTOList;
}
