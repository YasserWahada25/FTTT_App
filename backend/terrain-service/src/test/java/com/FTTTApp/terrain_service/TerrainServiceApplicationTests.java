package com.FTTTApp.terrain_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class TerrainServiceApplicationTests {

    @MockBean
    JwtDecoder jwtDecoder;

    @Test
    void contextLoads() {
    }

}
