package com.fixme.ecosystem.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers("/dev/**").permitAll()
                    .requestMatchers("/admin/**").permitAll()
                    .requestMatchers("/auth/**").permitAll()
                    .requestMatchers("/products/public").permitAll()
                    .requestMatchers("/products/public/**").permitAll()
                    .requestMatchers("/warranty/**").permitAll()
                    // Venta endpoints - allow authenticated users
                    .requestMatchers(HttpMethod.GET, "/products/inventory/disponible").permitAll()
                    .requestMatchers(HttpMethod.GET, "/products/inventory/transito").permitAll()
                    .requestMatchers(HttpMethod.GET, "/products/inventory/stock-local").permitAll()
                    .requestMatchers(HttpMethod.POST, "/products/inventory/register-sale").permitAll()
                    .requestMatchers(HttpMethod.GET, "/products/sales").permitAll()
                    .requestMatchers(HttpMethod.GET, "/products/sales/**").permitAll()
                    // Orders - checkout público y órdenes pendientes públicas
                    .requestMatchers(HttpMethod.POST, "/orders/checkout").permitAll()
                    .requestMatchers(HttpMethod.GET, "/orders/pending").permitAll()
                    .requestMatchers(HttpMethod.GET, "/orders/**").permitAll()
                    // Allow all product/inventory endpoints - security enforced via @PreAuthorize
                    .requestMatchers("/products/**").permitAll()
                    .requestMatchers("/orders/**").permitAll()
                    .requestMatchers("/imports/**").permitAll()
                    .requestMatchers("/sales/**").permitAll()
                    .requestMatchers("/users/**").permitAll()
                    .anyRequest().permitAll()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
