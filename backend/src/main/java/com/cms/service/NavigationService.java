package com.cms.service;
import com.cms.entity.*;
import com.cms.repository.NavigationMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Transactional
public class NavigationService {
    private final NavigationMenuRepository repo;
    private final DtoMapper mapper;
    @Transactional(readOnly=true)
    public List<Map<String,Object>> list() {
        return repo.findAll().stream().map(mapper::navMenu).collect(Collectors.toList());
    }
    public Map<String,Object> save(Map<String,Object> input, UUID existingId) {
        NavigationMenu menu = existingId != null
            ? repo.findById(existingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))
            : new NavigationMenu();
        if (existingId != null) menu.getItems().clear();
        menu.setKey((String)input.get("key")); menu.setLabel((String)input.get("label"));
        menu.setIsActive(Boolean.TRUE.equals(input.get("isActive"))); menu.setUpdatedAt(Instant.now());
        if (input.get("items") instanceof List<?> items) {
            for (Object obj : items) {
                if (obj instanceof Map<?,?> ic) {
                    NavigationItem ni = NavigationItem.builder().menu(menu)
                        .label((String)ic.get("label")).targetType((String)ic.get("targetType"))
                        .targetId(ic.get("targetId") != null ? UUID.fromString(ic.get("targetId").toString()) : null)
                        .url((String)ic.get("url"))
                        .sortOrder(ic.get("sortOrder") != null ? Integer.parseInt(ic.get("sortOrder").toString()) : 0)
                        .isVisible(Boolean.TRUE.equals(ic.get("isVisible"))).build();
                    menu.getItems().add(ni);
                }
            }
        }
        return mapper.navMenu(repo.save(menu));
    }
}
