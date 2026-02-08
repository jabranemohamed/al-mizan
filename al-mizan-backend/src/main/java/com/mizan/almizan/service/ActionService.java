package com.mizan.almizan.service;

import com.mizan.almizan.dto.ActionDTO;
import com.mizan.almizan.entity.Action;
import com.mizan.almizan.entity.UserDailyAction;
import com.mizan.almizan.repository.ActionRepository;
import com.mizan.almizan.repository.UserDailyActionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActionService {

    private final ActionRepository actionRepository;
    private final UserDailyActionRepository userDailyActionRepository;

    public List<ActionDTO> getAllActions() {
        return actionRepository.findByActiveTrue().stream()
                .map(ActionDTO::from)
                .collect(Collectors.toList());
    }

    public List<ActionDTO> getActionsByType(Action.ActionType type) {
        return actionRepository.findByTypeAndActiveTrue(type).stream()
                .map(ActionDTO::from)
                .collect(Collectors.toList());
    }

    /**
     * Get all actions with checked status for a given user and date
     */
    public List<ActionDTO> getActionsForUserAndDate(Long userId, LocalDate date) {
        List<Action> allActions = actionRepository.findByActiveTrue();
        List<UserDailyAction> userActions = userDailyActionRepository.findByUserIdAndActionDate(userId, date);

        Set<Long> checkedActionIds = userActions.stream()
                .filter(UserDailyAction::getChecked)
                .map(uda -> uda.getAction().getId())
                .collect(Collectors.toSet());

        return allActions.stream()
                .map(action -> {
                    ActionDTO dto = ActionDTO.from(action);
                    dto.setChecked(checkedActionIds.contains(action.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
