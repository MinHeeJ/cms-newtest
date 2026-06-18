package com.cms.config;
import com.cms.security.SessionFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<SessionFilter> sessionFilterReg(SessionFilter f) {
        FilterRegistrationBean<SessionFilter> b = new FilterRegistrationBean<>(f);
        b.addUrlPatterns("/api/*");
        b.setOrder(1);
        return b;
    }
}
