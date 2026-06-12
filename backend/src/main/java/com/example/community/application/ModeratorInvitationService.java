package com.example.community.application;

import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.ModeratorInvitation;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ModeratorInvitationService {
    public void replaceInvitations(CommunityCreationRequest request, List<InvitationCommand> commands) {
        List<ModeratorInvitation> invitations = commands == null
                ? List.of()
                : commands.stream()
                        .filter(command -> command.userIdentifier() != null && !command.userIdentifier().isBlank())
                        .map(command -> new ModeratorInvitation(command.userIdentifier(), command.message()))
                        .toList();
        request.replaceModeratorInvitations(invitations);
    }

    public record InvitationCommand(String userIdentifier, String message) {
    }
}
