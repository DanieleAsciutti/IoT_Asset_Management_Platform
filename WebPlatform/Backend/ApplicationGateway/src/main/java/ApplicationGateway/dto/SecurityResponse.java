package ApplicationGateway.dto;

import ApplicationGateway.dto.auth_AuthDTO.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SecurityResponse {

        private Role role;
        private String username;
}
