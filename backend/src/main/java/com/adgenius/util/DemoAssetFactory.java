package com.adgenius.util;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

public final class DemoAssetFactory {
    private DemoAssetFactory() {}

    public static byte[] demoPoster(String title, String subtitle) {
        int w = 1024;
        int h = 1024;
        BufferedImage image = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        GradientPaint paint = new GradientPaint(0, 0, new Color(12, 10, 28), w, h, new Color(76, 29, 149));
        g.setPaint(paint);
        g.fillRect(0, 0, w, h);
        g.setColor(new Color(99, 102, 241, 90));
        g.fillOval(-120, -80, 520, 520);
        g.setColor(new Color(56, 189, 248, 70));
        g.fillOval(540, 420, 620, 620);
        g.setColor(new Color(255, 255, 255, 230));
        g.setFont(new Font("SansSerif", Font.BOLD, 42));
        g.drawString("DEMO MODE", 72, 140);
        g.setFont(new Font("SansSerif", Font.BOLD, 48));
        drawWrapped(g, title == null ? "AdGenius sample creative" : title, 72, 280, 880, 56);
        g.setFont(new Font("SansSerif", Font.PLAIN, 28));
        g.setColor(new Color(196, 181, 253));
        drawWrapped(g, subtitle == null ? "Labeled sample — not a live model output" : subtitle, 72, 520, 880, 36);
        g.dispose();
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Unable to create demo image", e);
        }
    }

    public static byte[] demoVideoPlaceholder(String title) {
        String body = "AdGenius AI DEMO MODE video placeholder for: " + title
                + "\nThis is not a real generated video. Configure REPLICATE_API_TOKEN to use Replicate.";
        return body.getBytes(StandardCharsets.UTF_8);
    }

    private static void drawWrapped(Graphics2D g, String text, int x, int y, int maxWidth, int lineHeight) {
        FontMetrics fm = g.getFontMetrics();
        String[] words = text.split(" ");
        StringBuilder line = new StringBuilder();
        int cy = y;
        for (String word : words) {
            String trial = line.isEmpty() ? word : line + " " + word;
            if (fm.stringWidth(trial) > maxWidth) {
                g.drawString(line.toString(), x, cy);
                cy += lineHeight;
                line = new StringBuilder(word);
            } else {
                line = new StringBuilder(trial);
            }
        }
        if (!line.isEmpty()) {
            g.drawString(line.toString(), x, cy);
        }
    }
}
