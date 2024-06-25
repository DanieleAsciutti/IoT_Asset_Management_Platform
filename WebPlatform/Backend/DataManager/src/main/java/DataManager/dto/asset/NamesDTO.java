package DataManager.dto.asset;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class NamesDTO {
    private List<String> attributesName;
}
