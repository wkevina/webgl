def parse_image_dims(dims)
    dims.split('x').map(&:to_i)
end

fname = ARGV.shift
tilesize = ARGV.shift

raise "missing filename" unless fname
raise "invalid tilesize" unless tilesize and tilesize.match(/\d+x\d+/)

dirname = "#{fname}.tileset"

unless Dir.exists?(dirname)
    Dir.mkdir(dirname)
end

info = `identify #{fname}`.split(' ')
_, filetype, dims, rest = info

raise "unable to read dimensions of image" unless dims.match(/\d+x\d+/)

tile_width, tile_height = parse_image_dims(tilesize)
image_width, image_height = parse_image_dims(dims)

raise "invalid image and tile dimensions" unless (image_width % tile_width == 0) && (image_height % tile_height == 0)

count_x = image_width / tile_width
count_y = image_height / tile_height

index = 0
(0...count_y).each do |y_idx|
    (0...count_x).each do |x_idx|
        x, y = [x_idx * tile_width, y_idx * tile_height]
        cmd = "convert #{fname} -crop #{tile_width}x#{tile_height}+#{x}+#{y} #{dirname}/#{index}.#{filetype.downcase}"
        puts cmd
        puts `#{cmd}`
        index += 1
    end
end
