package ApplicationGateway.dto.assetManDTO;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class NamesDTO {
    private List<String> attributes;
}