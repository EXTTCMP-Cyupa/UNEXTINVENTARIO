package com.fixme.ecosystem.controller;

import com.fixme.ecosystem.dto.UserSummaryDTO;
import com.fixme.ecosystem.entity.User;
import com.fixme.ecosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryDTO>> listUsers(@RequestParam(required = false) String role) {
        log.info("Listando usuarios - Role: {}", role);
        List<User> users = role == null || role.isBlank()
                ? userRepository.findAll()
                : userRepository.findByRoleAndActiveTrue(role);

        List<UserSummaryDTO> response = users.stream()
                .filter(User::getActive)
                .map(user -> UserSummaryDTO.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
