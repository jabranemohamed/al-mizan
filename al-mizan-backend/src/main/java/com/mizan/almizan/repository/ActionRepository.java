package com.mizan.almizan.repository;

import com.mizan.almizan.entity.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActionRepository extends JpaRepository<Action, Long> {
    List<Action> findByTypeAndActiveTrue(Action.ActionType type);
    List<Action> findByActiveTrue();
    List<Action> findByCategory(String category);
}
